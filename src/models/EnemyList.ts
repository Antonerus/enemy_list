// models/Enemy.ts

export interface EnemyDoc {
  _id?: string; // or ObjectId if you want to use that explicitly
  name: string;
  grudgeLevel: number;
  description?: string;
}

export class Enemy {
  name: string;
  grudgeLevel: number;
  description?: string;

  constructor(name: string, grudgeLevel: number, description?: string) {
    this.name = name;
    this.grudgeLevel = grudgeLevel;
    this.description = description;
  }

  roast(): string {
    return `${this.name} is a level ${this.grudgeLevel}/10 level of enemy`;
  }

  escalate(amount: number) {
    this.grudgeLevel = Math.min(10, this.grudgeLevel + amount);
  }

  apologize(amount: number) {
    this.grudgeLevel = Math.max(0, this.grudgeLevel - amount);
  }

  // Convert a plain object (MongoDB doc) into an Enemy instance
  static fromDoc(doc: EnemyDoc): Enemy {
    return new Enemy(doc.name, doc.grudgeLevel, doc.description);
  }

  // Convert Enemy instance into a plain object for MongoDB insertion
  toDoc(): EnemyDoc {
    return {
      name: this.name,
      grudgeLevel: this.grudgeLevel,
      description: this.description,
    };
  }
}
