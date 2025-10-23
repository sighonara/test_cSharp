using System.Text.Json;
using test_cSharp.Models;

namespace test_cSharp.Services;

/**
 * This service is used to load and save the plants.json file.
 * In a larger application, this would be rejiggered to fetch and save from a database.
 */
public class PlantService {
    private readonly ILogger<PlantService> _logger;
    private const string FilePath = "plants.json";
    public List<Plant> Plants { get; private set; }
    private readonly JsonSerializerOptions _options = new() { WriteIndented = true };

    public PlantService(ILogger<PlantService> logger) {
        _logger = logger;
        LoadPlants();
    }

    private void LoadPlants() {
        try {
            if (!File.Exists(FilePath)) {
                throw new FileNotFoundException("File not found");
            }

            var json = File.ReadAllText(FilePath);
            Plants = JsonSerializer.Deserialize<List<Plant>>(json) ?? throw new Exception("Failed to deserialize");
            Console.WriteLine("Loaded " + Plants.Count + " plants");
        } catch (Exception e)
        {
            Console.WriteLine(e);
            _logger.LogError(e.Message);
            Environment.Exit(1);
        }
    }

    public void SavePlants() {
        var json = JsonSerializer.Serialize(Plants, _options);
        File.WriteAllText(FilePath, json);
    }
}