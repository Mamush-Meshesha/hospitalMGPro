export class RepresentationEngine {
  static format(data: any, v: string = 'default') {
    if (!data) return data;
    if (Array.isArray(data)) {
      return data.map(item => this.formatSingle(item, v));
    }
    return this.formatSingle(data, v);
  }

  private static formatSingle(item: any, v: string) {
    if (v === 'ref') {
      return {
        uuid: item.uuid,
        display: item.name || item.display || item.given_name || item.uuid
      };
    }
    
    if (v === 'full') {
      return item;
    }
    
    // Default representation (strip internal IDs)
    const clone = { ...item };
    for (const key in clone) {
      // Remove raw integer keys to force clients to rely on UUIDs
      if (key.endsWith('_id') || key === 'creator' || key === 'voided_by' || key === 'retired_by') {
        delete clone[key];
      } else if (typeof clone[key] === 'string') {
        clone[key] = clone[key].trim();
      }
    }
    return clone;
  }
}
