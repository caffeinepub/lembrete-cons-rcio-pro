import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type PaymentProofUpdateStatus = {
    __kind__: "error";
    error: {
        message: string;
    };
} | {
    __kind__: "isInactiveOrRejected";
    isInactiveOrRejected: {
        message: string;
        paymentProofId: PaymentProofId;
    };
} | {
    __kind__: "success";
    success: {
        paymentProofId: PaymentProofId;
    };
};
export type PaymentProofId = bigint;
export type UserId = Principal;
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export interface PaymentProof {
    id: PaymentProofId;
    status: PaymentProofStatus;
    userId: UserId;
    createdAt: bigint;
    codeProof?: string;
    isFile: boolean;
    fileProof?: ExternalBlob;
}
export interface PaymentProofUpdate {
    transactionCode?: string;
    isFile: boolean;
    uploadFile?: ExternalBlob;
}
export interface UserProfile {
    activated: boolean;
    name: string;
    email: string;
    enabled: boolean;
}
export enum PaymentProofStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllMyPaymentProofs(): Promise<Array<PaymentProof>>;
    getAllPaymentProofs(): Promise<Array<PaymentProof>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPaymentProof(proofId: PaymentProofId): Promise<PaymentProof | null>;
    getPaymentProofByStatus(status: PaymentProofStatus): Promise<Array<PaymentProof>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    healthCheck(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    isPaywallActive(): Promise<boolean>;
    isValidDocumentCode(documentCode: string): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    requestApproval(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    submitPaymentProof(payProv: PaymentProofUpdate): Promise<bigint>;
    updatePaymentProof(proofId: PaymentProofId, payProv: PaymentProofUpdate): Promise<PaymentProofUpdateStatus>;
    updatePaymentProofStatusByAdmin(paymentProofId: PaymentProofId, newStatus: PaymentProofStatus): Promise<void>;
}
