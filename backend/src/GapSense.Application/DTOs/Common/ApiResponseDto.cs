namespace GapSense.Application.DTOs.Common;

// standard API response wrapper - every endpoint returns this format
// so the frontend always knows what to expect
public class ApiResponseDto<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string Message { get; set; } = string.Empty;
    public List<string>? Errors { get; set; }

    // quick way to create a success response
    public static ApiResponseDto<T> SuccessResponse(T data, string message = "Success")
    {
        return new ApiResponseDto<T>
        {
            Success = true,
            Data = data,
            Message = message
        };
    }

    // quick way to create an error response
    public static ApiResponseDto<T> ErrorResponse(string message, List<string>? errors = null)
    {
        return new ApiResponseDto<T>
        {
            Success = false,
            Message = message,
            Errors = errors
        };
    }
}
