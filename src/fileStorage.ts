import type { ProcessedAreaData } from "./buildingAreaService";
import type { Storage, DataLock } from "./storage";

export class FileStorage implements Storage<ProcessedAreaData> {
  private readonly locks: { [id: string]: boolean } = {};
  private readonly baseFilePath = "./fileStore";

  async save(id: string, data: ProcessedAreaData): Promise<void> {
    if (this.isLocked(id)) {
      throw new Error(`File ${id} is locked`);
    }

    const lock = this.lock(id);

    const filename = this.filenameFromId(id);
    const jsonData = JSON.stringify(data);

    await Bun.write(filename, jsonData);

    this.unlock(lock);
  }

  async load(id: string): Promise<ProcessedAreaData | null> {
    if (await this.isLocked(id)) {
      throw new Error(`File ${id} is locked`);
    }

    const filename = this.filenameFromId(id);
    const contents = await this.readTextFile(filename);
    if (contents === null) {
      return null;
    }
    return JSON.parse(contents);
  }

  private lock(id: string): DataLock {
    if (this.isLocked(id)) {
      return { id };
    }

    this.locks[id] = true;

    return { id };
  }

  private unlock(lock: DataLock): void {
    if (!this.isLocked(lock.id)) {
      return;
    }

    this.locks[lock.id] = false;
  }

  private isLocked(id: string): boolean {
    return this.locks[id] || false;
  }

  private filenameFromId(id: string): string {
    return `${this.baseFilePath}/${id}.json`;
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
