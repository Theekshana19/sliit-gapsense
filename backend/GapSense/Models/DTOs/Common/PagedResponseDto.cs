namespace GapSense.Models.DTOs.Common;

// paginated response - used when returning a list of items with pagination
public class PagedResponseDto<T>
{
    public bool Success { get; set; } = true;
    public List<T> Data { get; set; } = new();
    public string Message { get; set; } = "Success";
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}
