// backend/Helpers/ApiResponse.cs
namespace ISPSystem.Helpers
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T Data { get; set; } = default!;

        public static ApiResponse<T> Ok(T data, string message = "Success")
        {
            return new ApiResponse<T>
            {
                Success = true,
                Message = message,
                Data = data
            };
        }

        public static ApiResponse<string> Fail(string message)
        {
            return new ApiResponse<string>
            {
                Success = false,
                Message = message,
                Data = default!
            };
        }
    }
}