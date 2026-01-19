import {
  Model,
  Document,
  FilterQuery,
  UpdateQuery,
  Types,
  PopulateOptions,
} from 'mongoose';

export class BaseRepository<T extends Document> {
  constructor(
    protected readonly model: Model<T>,
    private readonly populatePaths: (string | PopulateOptions)[] = [],
  ) {}

  async find(filter: FilterQuery<T> = {}) {
    return this.model.find(filter).populate<T>(this.populatePaths).lean<T>();
  }

  async findOne(filter: FilterQuery<T>) {
    return this.model.findOne(filter).populate(this.populatePaths).lean<T>();
  }

  async findById(id: string | Types.ObjectId) {
    return this.model.findById(id).populate(this.populatePaths).lean<T>();
  }

  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }

  async update(id: string | Types.ObjectId, update: UpdateQuery<T>) {
    return this.model
      .findByIdAndUpdate(id, update, { new: true })
      .populate(this.populatePaths)
      .lean<T>();
  }

  async delete(id: string | Types.ObjectId) {
    return this.model.findByIdAndDelete(id);
  }
}
