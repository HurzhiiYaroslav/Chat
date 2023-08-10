using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace webapi.Controllers
{

    [ApiController]
    [EnableCors("CORS")]
    [Authorize]
    public class FileController : ControllerBase
    {
        private readonly IWebHostEnvironment _hostEnvironment;

        public FileController(IWebHostEnvironment hostEnvironment)
        {
            _hostEnvironment = hostEnvironment;
        }

        [HttpGet("Download")]
        public IActionResult Download(string filePath, string fileType, string fileName)
        {
            try
            {
                var path = Path.Combine(_hostEnvironment.WebRootPath, "Media", filePath);
                if (!System.IO.File.Exists(path))
                {
                    return NotFound();
                }

                byte[] filedata = System.IO.File.ReadAllBytes(path);
                return File(filedata, fileType, fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while downloading the file.");
            }
        }

        [HttpGet("GetVideo")]
        public IActionResult GetVideo(string filePath)
        {
            try
            {
                var path = Path.Combine(_hostEnvironment.WebRootPath, "Media", filePath);
                string contentType;
                if (Path.GetExtension(filePath).Equals(".mp4", StringComparison.OrdinalIgnoreCase))
                {
                    contentType = "video/mp4";
                }
                else if (Path.GetExtension(filePath).Equals(".webm", StringComparison.OrdinalIgnoreCase))
                {
                    contentType = "video/webm";
                }
                else
                {
                    contentType = "application/octet-stream";
                }

                if (!System.IO.File.Exists(path))
                {
                    return NotFound();
                }

                byte[] fileStream = System.IO.File.ReadAllBytes(path);
                return File(fileStream, contentType, enableRangeProcessing: true);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while getting the video.");
            }
        }
    }
}
