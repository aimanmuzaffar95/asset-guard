import { getMetadataArgsStorage } from 'typeorm';
import { AssetEntity } from './asset.entity';

describe('AssetEntity', () => {
  it('defines notes as a nullable varchar column', () => {
    const column = getMetadataArgsStorage().columns.find(
      (metadata) =>
        metadata.target === AssetEntity && metadata.propertyName === 'notes',
    );

    expect(column).toBeDefined();
    expect(column?.options.type).toBe('varchar');
    expect(column?.options.nullable).toBe(true);
    expect(column?.options.length).toBe(1000);
  });
});
