 export class Product {
  id: number;
  name: string;
  price: number;
  description: string;
  sourceImage: string;
  sourceModel: string;
  type: 'bonsai' | 'pot' | 'accessory' | 'tools' | 'supply'; 

  constructor(
    id: number,
    name: string,
    price: number,
    description: string,
    sourceImage: string,
    sourceModel: string,
    type: 'bonsai' | 'pot' | 'accessory' | 'tools' | 'supply' 
  ) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.description = description;
    this.sourceImage = sourceImage;
    this.sourceModel = sourceModel;
    this.type = type; 
  }
}