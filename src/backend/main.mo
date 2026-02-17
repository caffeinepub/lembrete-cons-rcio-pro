import Map "mo:core/Map";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import UserApproval "user-approval/approval";
import Iter "mo:core/Iter";
import MixinStorage "blob-storage/Mixin";
import Text "mo:core/Text";

actor {
  include MixinStorage();

  // Authentication and authorization setup
  let accessControlState = AccessControl.initState();

  include MixinAuthorization(accessControlState);

  let approvalState = UserApproval.initState(accessControlState);

  // Type aliases and records
  type UserId = Principal;
  type PaymentProofId = Nat;

  public type UserProfile = {
    email : Text;
    name : Text;
    activated : Bool;
    enabled : Bool;
  };

  type PaymentProofStatus = {
    #pending;
    #approved;
    #rejected;
  };

  type PaymentProof = {
    id : PaymentProofId;
    userId : UserId;
    status : PaymentProofStatus;
    codeProof : ?Text;
    fileProof : ?Storage.ExternalBlob;
    isFile : Bool;
    createdAt : Nat;
  };

  public type PaymentProofUpdate = {
    transactionCode : ?Text;
    uploadFile : ?Storage.ExternalBlob;
    isFile : Bool;
  };

  type PaymentProofUpdateStatus = {
    #success : { paymentProofId : PaymentProofId };
    #isInactiveOrRejected : { paymentProofId : PaymentProofId; message : Text };
    #error : { message : Text };
  };

  // Internal state
  let userProfiles = Map.empty<Principal, UserProfile>();
  let paymentProofs = Map.empty<PaymentProofId, PaymentProof>();

  var nextPaymentProofId = 1;

  // User Profile Methods
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Approval Management Functions
  public query ({ caller }) func isCallerApproved() : async Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(approvalState, caller);
  };

  public shared ({ caller }) func requestApproval() : async () {
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.listApprovals(approvalState);
  };

  // Payment Proof Functions
  public query ({ caller }) func healthCheck() : async Bool {
    true;
  };

  public shared ({ caller }) func submitPaymentProof(payProv : PaymentProofUpdate) : async Nat {
    assertPaywallActive();
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit payment proofs");
    };

    let paymentProof = {
      id = nextPaymentProofId;
      userId = caller;
      status = #pending;
      codeProof = payProv.transactionCode;
      fileProof = payProv.uploadFile;
      isFile = payProv.isFile;
      createdAt = 0;
    };

    paymentProofs.add(nextPaymentProofId, paymentProof);

    let currentId = nextPaymentProofId;
    nextPaymentProofId += 1;
    currentId;
  };

  public shared ({ caller }) func updatePaymentProof(proofId : PaymentProofId, payProv : PaymentProofUpdate) : async PaymentProofUpdateStatus {
    assertPaywallActive();
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update payment proofs");
    };

    let existingProof = switch (paymentProofs.get(proofId)) {
      case (null) { Runtime.trap("No payment proof found") };
      case (?proof) { proof };
    };

    if (existingProof.userId != caller) {
      Runtime.trap("Users can only update their own payment proofs");
    };

    switch (existingProof.status) {
      case (#pending) {
        let updatedProof = {
          existingProof with
          codeProof = payProv.transactionCode;
          fileProof = payProv.uploadFile;
          isFile = payProv.isFile;
          createdAt = 0;
        };

        paymentProofs.add(proofId, updatedProof);
        #success { paymentProofId = proofId };
      };
      case (#rejected) {
        #isInactiveOrRejected {
          paymentProofId = proofId;
          message = "This proof has been rejected. Please create new payment proof instead.";
        };
      };
      case (_) {
        #isInactiveOrRejected {
          paymentProofId = proofId;
          message = "This payment proof is no longer editable";
        };
      };
    };
  };

  public query ({ caller }) func getPaymentProof(proofId : PaymentProofId) : async ?PaymentProof {
    let proof = switch (paymentProofs.get(proofId)) {
      case (null) { return null };
      case (?p) { p };
    };

    // Users can only view their own payment proofs, admins can view all
    if (proof.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own payment proofs");
    };

    ?proof;
  };

  public query ({ caller }) func getAllMyPaymentProofs() : async [PaymentProof] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view payment proofs");
    };
    paymentProofs.values().filter(
      func(prov) { prov.userId == caller }
    ).toArray();
  };

  // Fetch with PaymentProofStatus
  public query ({ caller }) func getPaymentProofByStatus(status : PaymentProofStatus) : async [PaymentProof] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can query payment proofs by status");
    };
    paymentProofs.values().filter(
      func(prov) { prov.status == status }
    ).toArray();
  };

  public query ({ caller }) func getAllPaymentProofs() : async [PaymentProof] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all payment proofs");
    };
    paymentProofs.values().toArray();
  };

  public shared ({ caller }) func updatePaymentProofStatusByAdmin(paymentProofId : PaymentProofId, newStatus : PaymentProofStatus) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update payment proof status");
    };

    let paymentProof = switch (paymentProofs.get(paymentProofId)) {
      case (null) { Runtime.trap("Payment proof does not exist!") };
      case (?p) { p };
    };
    let updated = { paymentProof with status = newStatus };
    paymentProofs.add(paymentProofId, updated);
  };

  public query ({ caller }) func isPaywallActive() : async Bool {
    switch (awatingPaywallActivation()) {
      case (true) { false };
      case (false) { true };
    };
  };

  // Validation Methods
  public query ({ caller }) func isValidDocumentCode(documentCode : Text) : async Bool {
    documentCode.size() >= 12;
  };

  // Validation Helpers
  func awatingPaywallActivation() : Bool {
    true;
  };

  func assertPaywallActive() {
    switch (awatingPaywallActivation()) {
      case (true) { Runtime.trap("Paywall is not active") };
      case (false) { () };
    };
  };
};
