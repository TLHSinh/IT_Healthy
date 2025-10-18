using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ITHealthy.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TestController : ControllerBase
    {

        [HttpGet("public")]
        public IActionResult Public()
        {
            return Ok("This is a public endpoint");
        }

        [Authorize]
        [HttpGet("protected")]
        public IActionResult Protected ()
        {
            return Ok("This is a protected endpoin. you are authorized");
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin")]
        public IActionResult Admin()
        {
            return Ok("This is a admin endpoin. you are authorized as an admin");
        } 
    }
}
