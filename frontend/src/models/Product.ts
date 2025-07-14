export class Product {
  id: number;
  name: string;
  price: string;
  description: string;
  sourceImage: string;
  sourceModel: string;

  constructor(
    id: number,
    name: string,
    price: string,
    description: string,
    sourceImage: string,
    sourceModel: string
  ) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.description = description;
    this.sourceImage = sourceImage;
    this.sourceModel = sourceModel;
  }
}