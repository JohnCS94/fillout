import express, { Request, Response } from "express";
import { isValid, parseISO } from "date-fns";
import axios from "axios";
import dotenv from "dotenv";

import { FilterClauseType, ResponseData } from "./types";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const apiKey = process.env.API_KEY;
const demoFormId = process.env.DEMO_FORM_ID;

/**
 * Function to determin validity of a string to be used as a date
 * @param dateString - Any given string
 * @returns bool - True if a valid string
 */
const isValidDateString = (dateString: string) => {
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
const compareValues = (
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

app.get("/", (req, res) => {
  const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>John Scipion - Application</title>
      </head>
      <body>
        <h1>Welcome!</h1>
        <p>If you would like to see some responses please navigate to https://{domain}/{formId}/filteredResponses</p>
        <p>Add any desired query parameters</p>
        <p>Example generic fillout query param: ?beforeDate=2024-03-01</p>
        <p>Example filter query param: ?filters=[{"id":"jB2qDRcXQ8Pjo1kg3jre2J","condition":"equals","value":"Engineering"}]</p>
        <p>Query Params can be combined using & symbol. Example: ?beforeDate=2024-03-01&filters=[{"id":"jB2qDRcXQ8Pjo1kg3jre2J","condition":"equals","value":"Engineering"}] </p>
      </body>
      </html>
    `;

  res.send(htmlContent);
});

app.get("/:formId/filteredResponses", async (req: Request, res: Response) => {
  const { formId } = req.params;
  const limit = req.query.limit ? Math.min(Number(req.query.limit), 150) : 150;
  const {
    afterDate,
    beforeDate,
    offset = 0,
    status,
    includeEditLink,
    sort,
  } = req.query;
  const filters = req.query.filters;
  const parsedFilters: FilterClauseType[] = filters
    ? JSON.parse(filters as string)
    : [];

  try {
    const response = await axios.get(
      `https://api.fillout.com/v1/api/forms/${formId}/submissions`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        params: {
          afterDate: afterDate,
          beforeDate: beforeDate,
          offset: offset,
          status: status,
          includeEditLink: includeEditLink,
          sort: sort,
        },
      }
    );

    const responses: ResponseData = response.data;

    /**
     * My interpretation was to filter out the response that did not include
     * a question that satisfied the parameters. Questions that don't meet the
     * conditions will still be in the response so long as they belong to a
     * response group of a question that did.
     */
    const filteredResponses = responses.responses.filter((response) => {
      for (const filter of parsedFilters) {
        const question = response.questions.find((q) => q.id === filter.id);
        if (!question) return false;

        let value: string | number | Date = question.value;

        if (typeof filter.value === "number") {
          value = Number(value);
        } else if (isValidDateString(filter.value)) {
          value = new Date(value);
        }

        if (!compareValues(value, filter.value, filter.condition)) {
          return false;
        }
      }

      return true;
    });

    /* Returnes the number of responses that were filtered out from
     * filtered conditions
     */
    const filtered = responses.responses.length - filteredResponses.length;
    console.log("Filtered Responses: ", filtered);

    res.json({
      responses: filteredResponses,
      totalReponses: filteredResponses.length,
      pageCount: Math.ceil(filteredResponses.length) / Number(limit),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
