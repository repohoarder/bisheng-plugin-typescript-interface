export interface ITableConfig {
  filePath: string;
  interfaceName: string;
  language: string;
  columnNames?: IColumn[];
}

export interface IColumn {
  label: string;
  key: string;
}

export function parserTableConfig(tableConfig: string): ITableConfig {
  const config: ITableConfig = JSON.parse(tableConfig);

  const { filePath, interfaceName, columnNames, language } = config;

  if (!filePath) {
    throw new Error('filePath is required');
  }
  if (!interfaceName) {
    throw new Error('interfaceName is required');
  }

  return {
    filePath,
    interfaceName,
    language,
    columnNames:
      Array.isArray(columnNames) && columnNames.length > 0
        ? columnNames
        : [
            { label: 'Property', key: 'name' },
            { label: 'Description', key: 'description' },
            { label: 'Type', key: 'types' },
            { label: 'Default', key: 'default' }
          ]
  };
}

export function jsonToMarkdownTable(
  rows: {
    [column: string]: string;
  }[],
  columns: IColumn[]
) {
  const result = [];
  result.push(`|${columns.map(o => o.label).join(' | ')}|`);
  result.push(`|${columns.map(_ => '---').join('|')}|`);
  for (const row of rows) {
    result.push(
      `|${columns.map(({ key }) => (row[key] ? row[key] : '-')).join('|')}|`
    );
  }
  return result.join('\r\n');
}
