namespace GapSense.Application.DTOs.Requests;

public sealed record CreateReferralRequest(
    Guid StudentProfileId,
    string ReferralType,
    string ReferredTo,
    string Reason,
    string Status,
    string CreatedBy
);
