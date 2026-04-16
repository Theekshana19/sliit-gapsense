using GapSense.Application.DTOs.Responses;
using GapSense.Application.Interfaces.Repositories;
using GapSense.Application.Interfaces.Services;
using GapSense.Domain.Entities;

namespace GapSense.Application.Services;

public sealed class SemesterService : ISemesterService
{
    private readonly ISemesterRepository _repo;

    public SemesterService(ISemesterRepository repo)
    {
        _repo = repo;
    }

    public async Task<IReadOnlyList<SemesterResponse>> ListAsync(CancellationToken ct)
    {
        var list = await _repo.ListActiveOrderedAsync(ct);
        return list.Select(ToDto).ToList();
    }

    public async Task<SemesterResponse?> GetCurrentAsync(CancellationToken ct)
    {
        var s = await _repo.GetCurrentAsync(ct);
        return s is null ? null : ToDto(s);
    }

    private static SemesterResponse ToDto(Semester s) =>
        new(
            s.Id,
            s.Name,
            s.AcademicYear,
            s.Term,
            s.IsCurrent,
            s.StartDate.ToString("yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture),
            s.EndDate.ToString("yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture),
            s.IsActive);
}
