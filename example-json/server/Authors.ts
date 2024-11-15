import { GenezioDeploy, GenezioAuth, GnzContext } from "@genezio/types";
import {IDataProviderService, DataProviderListParams} from "./DataProvider";
import data from "./data.json";

type Author = {
  id?: number;
  name: string;
}

let ad: Author[] = data.authors

@GenezioDeploy()
export class Authors implements IDataProviderService<Author>{
  constructor() {}

  async getList(_context: GnzContext, {pagination, sorters, filters} : DataProviderListParams) {
    const {current, pageSize} = pagination;
  
    // Filter the data
    let filteredData = ad;
  
    if (filters && filters.length > 0) {
      filters.forEach((filter: any) => {
        if (filter.field === "name" && filter.operator === "contains" && filter.value) {
          filteredData = filteredData.filter((item: any) =>
            item.name.toLowerCase().includes(filter.value.toLowerCase())
          );
        }
      });
    }
  
    // Sort the data
    if (sorters && sorters.length > 0) {
      const sorter = sorters[0]; // Assuming single sorter for simplicity
      const { field, order } = sorter;
  
      filteredData = filteredData.sort((a: any, b: any) => {
        if (order === 'asc') {
          return a[field] > b[field] ? 1 : -1;
        } else {
          return a[field] < b[field] ? 1 : -1;
        }
      });
    }
  
    // Apply pagination to the filtered and sorted data
    const startIndex = (current - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredData.slice(startIndex, endIndex);
  
    return {data: paginatedData, total: filteredData.length};
  }
  
  async getOne(context: GnzContext, id: number) {
    return {data: ad.find((item) => item.id == id), total: 1};
  }
  
  @GenezioAuth()
  async create(context: GnzContext, c: Author) {
    console.log("User: ", context.user?.email, " created an author");
    c.id = ad.length + 1;
    ad.push(c);
    return ad.find((item) => item.id == ad.length);
  }

  @GenezioAuth()
  async update(context: GnzContext, c: Author) {
    console.log("User: ", context.user?.email, " updated an author");
    const index = ad.findIndex((item) => item.id == c.id);
    if (index === -1) throw new Error("Not found");
    ad[index].name = c.name;
    return ad[index];
  }

  @GenezioAuth()
  async deleteOne(context: GnzContext, id: number) {
    console.log("User: ", context.user?.email, " deleted an author");
    const index = ad.findIndex((item) => item.id == id);
    if (index === -1) throw new Error("Not found");
    ad.splice(index, 1);
    return true;
  }
}