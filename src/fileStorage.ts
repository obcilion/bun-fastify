import type { ProcessedAreaData } from "./buildingAreaService";
import type { Storage, DataLock } from "./storage";

export class FileStorage implements Storage<ProcessedAreaData> {
  private readonly locks: { [id: string]: boolean } = {};

  async save(id: string, data: ProcessedAreaData): Promise<void> {
    if (await this.isLocked(id)) {
      throw new Error("File is locked");
    }

    const filename = this.filenameFromId(id);
    const jsonData = JSON.stringify(data);

    await Bun.write(`./${filename}`, jsonData);
  }

  async load(id: string): Promise<ProcessedAreaData | null> {
    if (await this.isLocked(id)) {
      throw new Error("File is locked");
    }

    const filename = this.filenameFromId(id);
    const contents = await this.readTextFile(filename);
    if (contents === null) {
      return null;
    }
    return JSON.parse(contents);
  }

  async lock(id: string): Promise<DataLock> {
    if (await this.isLocked(id)) {
      return { id };
    }

    this.locks[id] = true;

    return { id };
  }

  async unlock(lock: DataLock): Promise<void> {
    if (!(await this.isLocked(lock.id))) {
      return;
    }

    this.locks[lock.id] = false;
  }

  private async isLocked(id: string): Promise<boolean> {
    return this.locks[id] || false;
  }

  private filenameFromId(id: string): string {
    return `${id}.json`;
  }

  private async readTextFile(filename: string): Promise<string | null> {
    try {
      const file = Bun.file(filename);
      const text = await file.text();
      return text;
    } catch (_) {
      return null;
    }
  }
}
