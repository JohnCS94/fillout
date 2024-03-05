import { isValid, parseISO } from "date-fns";
import { FilterClauseType } from "./types";

/**
 * Function to determin validity of a string to be used as a date
 * @param dateString - Any given string
 * @returns bool - True if a valid string
 */
export const isValidDateString = (dateString: string) => {
  const parsedDate = parseISO(dateString);
  return isValid(parsedDate);
};

/**
 * Compares the filter values with the value of the question to filter out any
 * questions
 * @param value - A number or a string
 * @param filterValue - A number or a string
 * @param condition - Conditional comparison checks
 * @returns bool - True if comparision check is valid
 */
export const compareValues = (
  value: any,
  filterValue: any,
  condition: FilterClauseType["condition"]
) => {
  switch (condition) {
    case "equals":
      return value == filterValue;
    case "does_not_equal":
      return value != filterValue;
    case "greater_than":
      return value > filterValue;
    case "less_than":
      return value < filterValue;
    default:
      return false;
  }
};
