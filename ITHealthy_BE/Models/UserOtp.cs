using System;
using System.Collections.Generic;

namespace ITHealthy.Models;

public partial class UserOtp
{
    public int Otpid { get; set; }

    public int CustomerId { get; set; }

    public string Otpcode { get; set; } = null!;

    public DateTime ExpiryTime { get; set; }

    public bool? IsUsed { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Customer Customer { get; set; } = null!;
}
