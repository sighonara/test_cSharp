namespace test_cSharp.Models;

public class Plant {
    public string Name { get; set; }
    public string ScientificName { get; set; }
    public string Habitat { get; set; }
    public string SomethingInteresting { get; set; }
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
