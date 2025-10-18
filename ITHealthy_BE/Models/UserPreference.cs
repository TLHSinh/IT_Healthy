using System;
using System.Collections.Generic;

namespace ITHealthy.Models;

public partial class UserPreference
{
    public int PreferenceId { get; set; }

    public int CustomerId { get; set; }

    public int? PreferredCategoryId { get; set; }

    public string? DietaryPreference { get; set; }

    public string? LanguageMode { get; set; }

    public string? ThemeMode { get; set; }

    public DateTime? LastUpdated { get; set; }

    public virtual Customer Customer { get; set; } = null!;

    public virtual Category? PreferredCategory { get; set; }
}
