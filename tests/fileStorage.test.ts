import { expect, test, describe } from "bun:test";
import { BuildingAreaService } from "../src/buildingAreaService";
import {
  getBuildingAreaInput,
  getLeftHPlatCoords,
  getMiddlebLimCoords,
  getRightHPlatCoords,
} from "./dataGenerators";
import { FileStorage } from "../src/fileStorage";

// In an ideal world this test would not depend on the bulding area service,
//  instead getting the test data directly from a generator
const buildingAreaService = new BuildingAreaService();

// TODO: dependency injection
const fileStorage = new FileStorage();

describe("FileStorage", () => {
  test("it correctly saves and loads a file", async () => {
    const processedAreaData = getProcessedData();
    const id = "saveTest";

    await fileStorage.save(id, processedAreaData);
    const loadedData = await fileStorage.load(id);

    expect(loadedData).toEqual(processedAreaData);
  });

  test("it returns null when loading a nonexisting file", async () => {
    const id = "non-existing";
    const loadedData = await fileStorage.load(id);
    expect(loadedData).toBeNull();
  });

  test("it locks files correctly", async () => {
    const processedAreaData = getProcessedData();
    const id = "lockTest";
    await fileStorage.save(id, processedAreaData);
    const lock = await fileStorage.lock(id);

    const loadFunc = async () => {
      await fileStorage.load(id);
    };

    expect(loadFunc).toThrow();

    const saveFunc = async () => {
      await fileStorage.save(id, processedAreaData);
    };

    expect(saveFunc).toThrow();

    await fileStorage.unlock(lock);

    await fileStorage.load(id);
    await fileStorage.save(id, processedAreaData);
  });
});

function getProcessedData() {
  const testData = getBuildingAreaInput(
    getMiddlebLimCoords(),
    getLeftHPlatCoords(),
    getRightHPlatCoords()
  );
  const processAreaDataResult = buildingAreaService.processAreaData(testData);
  if (processAreaDataResult.success === false) {
    throw new Error("Data processing must work");
  }

  return processAreaDataResult.data;
}
