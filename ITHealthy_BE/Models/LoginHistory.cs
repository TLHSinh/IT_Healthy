using System;
using System.Collections.Generic;

namespace ITHealthy.Models;

public partial class LoginHistory
{
    public int LoginId { get; set; }

    public int CustomerId { get; set; }

    public DateTime? LoginTime { get; set; }

    public DateTime? LogoutTime { get; set; }

    public string? Ipaddress { get; set; }

    public string? DeviceInfo { get; set; }

    public string? StatusLog { get; set; }

    public string? Reason { get; set; }

    public virtual Customer Customer { get; set; } = null!;
}
