export interface Storage<Model> {
  save(id: string, data: Model): Promise<void>;
  load(id: string): Promise<Model | null>;
}

export interface DataLock {
  id: string;
}
