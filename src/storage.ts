export interface Storage<Model> {
  save(id: string, data: Model): Promise<void>;
  load(id: string): Promise<Model | null>;
  lock(id: string): Promise<DataLock>;
  unlock(lock: DataLock): Promise<void>;
}

export interface DataLock {
  id: string;
}
