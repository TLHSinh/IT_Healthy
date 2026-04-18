public class Blog
{
    public int BlogId { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string? Content { get; set; }
    public string? Image { get; set; }
    public string? Category { get; set; }
    public bool IsPublished { get; set; }
    public DateTime CreatedAt { get; set; }
}