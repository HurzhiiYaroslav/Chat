using Azure;
using HtmlAgilityPack;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using webapi.Shared;

namespace webapi.Controllers
{
    [ApiController]
    [EnableCors("CORS")]
    [Authorize]
    public class LinkPreviewController : Controller
    {
        [HttpGet("/link-preview")]
        public async Task<IActionResult> GetLinkPreviewAsync(string url)
        {
            try
            {
                using var httpClient = new HttpClient();
                var htmlContent = await httpClient.GetStringAsync(url);

                var htmlDocument = new HtmlDocument();
                htmlDocument.LoadHtml(htmlContent);

                var title = htmlDocument.DocumentNode.SelectSingleNode("//title")?.InnerText;
                var description = htmlDocument.DocumentNode.SelectSingleNode("//meta[@name='description']")?.GetAttributeValue("content", "");
                var image = htmlDocument.DocumentNode.SelectSingleNode("//meta[@property='og:image']")?.GetAttributeValue("content", "");

                var previewData = new
                {
                    title,
                    description,
                    image
                };
                
                return Ok(new ApiResponse { Success = true, Data = previewData });
            }
            catch (Exception ex)
            {
                return BadRequest($"Error fetching link preview: {ex.Message}");
            }
        }
    }
}
