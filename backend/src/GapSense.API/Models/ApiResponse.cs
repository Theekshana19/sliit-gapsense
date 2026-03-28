namespace GapSense.API.Models;

// standard API response wrapper - matches the Application layer DTOs
// kept here for controllers that need a quick response without DTOs
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }

    public static ApiResponse<T> Ok(T data, string message = "Success")
        => new() { Success = true, Data = data, Message = message };

    public static ApiResponse<T> Fail(string message)
        => new() { Success = false, Message = message };
}
