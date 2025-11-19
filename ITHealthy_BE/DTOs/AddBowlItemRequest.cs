public class CreateBowlRequest
{
    public int CustomerId { get; set; }
    public string BowlName { get; set; }
    public List<BowlIngredientRequest> Ingredients { get; set; }
}

public class BowlIngredientRequest
{
    public int IngredientId { get; set; }
    public decimal Quantity { get; set; }
}
