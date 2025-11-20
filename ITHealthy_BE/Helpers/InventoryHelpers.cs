public class OperationResult
{
    public bool IsSuccess { get; set; }
    public string? ErrorMessage { get; set; }

    public static OperationResult Success()
        => new OperationResult { IsSuccess = true };

    public static OperationResult Fail(string message)
        => new OperationResult { IsSuccess = false, ErrorMessage = message };
}


