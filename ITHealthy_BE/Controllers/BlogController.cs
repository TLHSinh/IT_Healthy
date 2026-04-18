using ITHealthy.Data;
using ITHealthy.DTOs;
using ITHealthy.Models;
using ITHealthy.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ITHealthy.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BlogController : ControllerBase
    {
        private readonly ITHealthyDbContext _context;
        private readonly CloudinaryService _cloudinaryService;

        public BlogController(ITHealthyDbContext context, CloudinaryService cloudinaryService)
        {
            _context = context;
            _cloudinaryService = cloudinaryService;
        }

        // 🔥 USER - chỉ lấy bài đã publish
        // GET: /api/blog
        [HttpGet]
        public async Task<IActionResult> GetBlogs(string? keyword)
        {
            var query = _context.Blogs.AsQueryable();

            query = query.Where(b => b.IsPublished);

            if (!string.IsNullOrEmpty(keyword))
                query = query.Where(b =>
                    b.Title.Contains(keyword) ||
                    b.Description.Contains(keyword)
                );

            var blogs = await query
                .OrderByDescending(b => b.CreatedAt)
                .Select(b => new BlogDTO
                {
                    BlogId = b.BlogId,
                    Title = b.Title,
                    Description = b.Description,
                    Content = b.Content,
                    Image = b.Image,
                    Category = b.Category,
                    IsPublished = b.IsPublished,
                    CreatedAt = b.CreatedAt
                })
                .ToListAsync();

            return Ok(blogs);
        }

        // 🔥 ADMIN - lấy ALL blog
        // GET: /api/blog/all-blogs
        [HttpGet("all-blogs")]
        public async Task<IActionResult> GetAllBlogs(string? keyword)
        {
            var query = _context.Blogs.AsQueryable();

            if (!string.IsNullOrEmpty(keyword))
                query = query.Where(b =>
                    b.Title.Contains(keyword) ||
                    b.Description.Contains(keyword)
                );

            var blogs = await query
                .OrderByDescending(b => b.CreatedAt)
                .Select(b => new BlogDTO
                {
                    BlogId = b.BlogId,
                    Title = b.Title,
                    Description = b.Description,
                    Content = b.Content,
                    Image = b.Image,
                    Category = b.Category,
                    IsPublished = b.IsPublished,
                    CreatedAt = b.CreatedAt
                })
                .ToListAsync();

            return Ok(blogs);
        }

        // 🔥 GET DETAIL (User chỉ thấy bài publish)
        // GET: /api/blog/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBlog(int id)
        {
            var blog = await _context.Blogs
                .Where(b => b.BlogId == id && b.IsPublished)
                .Select(b => new BlogDTO
                {
                    BlogId = b.BlogId,
                    Title = b.Title,
                    Description = b.Description,
                    Content = b.Content,
                    Image = b.Image,
                    Category = b.Category,
                    IsPublished = b.IsPublished,
                    CreatedAt = b.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (blog == null)
                return NotFound(new { message = "Không tìm thấy blog" });

            return Ok(blog);
        }

        // 🔥 CREATE
        // POST: /api/blog
        [HttpPost]
        public async Task<IActionResult> AddBlog([FromForm] BlogDTO request)
        {
            if (string.IsNullOrEmpty(request.Title))
                return BadRequest(new { message = "Title không được để trống" });

            string? imageUrl = null;

            if (request.ImageFile != null && request.ImageFile.Length > 0)
            {
                imageUrl = await _cloudinaryService.UploadImageProductAsync(request.ImageFile);
            }

            var blog = new Blog
            {
                Title = request.Title,
                Description = request.Description,
                Content = request.Content,
                Category = request.Category,
                Image = imageUrl,
                IsPublished = request.IsPublished ?? false,
                CreatedAt = DateTime.Now
            };

            _context.Blogs.Add(blog);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Tạo blog thành công",
                blog
            });
        }

        // 🔥 UPDATE
        // PUT: /api/blog/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBlog(int id, [FromForm] BlogDTO request)
        {
            var blog = await _context.Blogs.FindAsync(id);
            if (blog == null)
                return NotFound(new { message = "Không tìm thấy blog" });

            if (request.ImageFile != null && request.ImageFile.Length > 0)
            {
                blog.Image = await _cloudinaryService.UploadImageProductAsync(request.ImageFile);
            }

            blog.Title = request.Title;
            //blog.Description = request.Description;
            //blog.Content = request.Content;
            blog.Content = request.Content ?? blog.Content;
            blog.Description = request.Description ?? blog.Description;
            blog.Category = request.Category;
            blog.IsPublished = request.IsPublished ?? blog.IsPublished;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Cập nhật thành công",
                blog
            });
        }

        // 🔥 DELETE
        // DELETE: /api/blog/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBlog(int id)
        {
            var blog = await _context.Blogs.FindAsync(id);
            if (blog == null)
                return NotFound(new { message = "Không tìm thấy blog" });

            _context.Blogs.Remove(blog);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa blog thành công" });
        }

        // 🔥 TOGGLE PUBLISH (chuẩn CMS)
        // PATCH: /api/blog/{id}/publish
        [HttpPatch("{id}/publish")]
        public async Task<IActionResult> TogglePublish(int id)
        {
            var blog = await _context.Blogs.FindAsync(id);
            if (blog == null)
                return NotFound();

            blog.IsPublished = !blog.IsPublished;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = blog.IsPublished ? "Đã publish" : "Đã ẩn bài viết",
                blog.IsPublished
            });
        }
    }
}