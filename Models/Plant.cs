using System.ComponentModel.DataAnnotations;

namespace test_cSharp.Models;

public class Plant {
    /// <summary>
    /// The unique name of the plant (case-insensitive)
    /// </summary>
    [Required]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// The scientific/Latin name of the plant
    /// </summary>
    [Required]
    public string ScientificName { get; set; } = string.Empty;

    /// <summary>
    /// The natural habitat where this plant grows
    /// </summary>
    [Required]
    public string Habitat { get; set; } = string.Empty;

    /// <summary>
    /// An interesting fact about this plant
    /// </summary>
    [Required]
    public string SomethingInteresting { get; set; } = string.Empty;

    /// <summary>
    /// The last time this plant record was updated
    /// </summary>
    public DateTime Updated { get; set; }

    public Plant() {
        Updated = DateTime.Now;
    }

    public Plant(string name, string scientificName, string habitat, string somethingInteresting) : this() {
        Name = name;
        ScientificName = scientificName;
        Habitat = habitat;
        SomethingInteresting = somethingInteresting;
    }
}
