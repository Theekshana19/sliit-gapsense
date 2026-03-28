using System.ComponentModel.DataAnnotations;

namespace GapSense.Application.DTOs.Readiness;

// what the frontend sends when creating a learning resource
public class CreateResourceDto
{
    [Required(ErrorMessage = "Title is required")]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [StringLength(1000)]
    public string Description { get; set; } = string.Empty;

    [Required(ErrorMessage = "Type is required")]
    public string Type { get; set; } = "Link";

    [Required(ErrorMessage = "URL is required")]
    [StringLength(500)]
    public string Url { get; set; } = string.Empty;

    [StringLength(200)]
    public string Topic { get; set; } = string.Empty;

    [Required(ErrorMessage = "Module is required")]
    public Guid ModuleId { get; set; }
}
