namespace GapSense.Application.DTOs.Requests;

public sealed record UpdateReferralRequest(
    string ReferralType,
    string ReferredTo,
    string Reason,
    string Status,
    bool IsActive
);
