import os
import pandas as pd
import pyodbc
import requests
import sys
from fastapi import FastAPI
from fastapi.responses import FileResponse
from pydantic import BaseModel


def get_query(question):
    api_key = os.environ['OPENAI_API_KEY']
    headers = {"Authorization": f"Bearer {api_key}"}
    data = {
        "model": "gpt-4-turbo-preview",
        "messages": [
            {
                "role": "system",
                "content": """
[EDW_GBS].[Infosys].[GBS_O2O_QUOTEVOLUMETRIC] has this schema:

```
ColumnName: DataType
OrderCode: varchar
Quote Country: varchar
Quote with Version: varchar
QuoteNumber: varchar
Version: int
OrganisationCode: int
SalesForceOpportunityCode: varchar
Quote Status: varchar
DateEntered: datetime
Quote Amount: float
QuoteCurrencyCode: varchar
Quote Amount USD: float
Email: varchar
QuoteName: varchar
DocumentType: varchar
OrderReason: varchar
Creator Direct Quote: varchar
Sales Person: varchar
Adjusted CreatedBy: varchar
OCN: int
DimensiondataSalesOrderNumber: varchar
PurchaseOrderNumber: varchar
PurchaseOrderDate: datetime
PostToERPDate: datetime
SubmittedToERP: char
PO OrderType: int
PO Status: varchar
Quote Request Date: datetime2
Case CreatedBy: nvarchar
CaseNumber: nvarchar
Case SalesLocalRegion: nvarchar
SubmittedDate_Min: datetime
SubmittedDate_Max: datetime
Flag_CreatedBy1: nvarchar
ProcessedBy: varchar
Flag_CreatedBy: nvarchar
Quote_status_Flag: int
Aging_In_Days: int
Aging_Bucket: varchar
Flag_QuoteToOrder: int
IsMaxVersion: int
IsMinVersion: int
Filter QuoteCycleTime: int
Filter LTTQ: int
OpportunityCode: nvarchar
MonthYear: varchar
MonthYear_Sort: int
DayMonth: varchar
DayMonth_Sort: int
WeekEnd: nvarchar
Period: date
Mapping_Key_Country: nvarchar
Country: varchar
Quote Request Date_Local: datetime2
SubmittedDate_Min_Local: datetime
SubmittedDate_Max_Local: datetime
GMT+Time Zone (Mins): int
Work Start_Local: time
Work End_Local: time
InsertedDate: datetime
FTE: float
Week: nvarchar
Week_Sort: int
Case Created Owner: nvarchar
SubmittedDate_Min_Reference: datetime
SubmittedDate_Max_Reference: datetime
DealType: nvarchar
Flag_RenewalQuote: int
FTE_USER: nvarchar
BPM_NonBPM_Flag: nvarchar
SubmittedDate_Min_Reference_WF: datetime
SubmittedDate_Max_Reference_WF: datetime
Job_Level: nvarchar
L2 Process: nvarchar
Flag_Reason_LTTQ_Exclusion: nvarchar
Direct_CaseNumber: nvarchar
Case Type: nvarchar
SubCaseType: nvarchar
IsGAMRequired: int
Flag_Nihilent_User: nvarchar
TechArch Flag: int
Flag_SDI: varchar
Flag_Cisco: varchar
Client Manager: varchar
SalesTeam: varchar
PostToERPEmail: varchar
QuoteCancelReason: varchar
QuoteVersionReason: varchar
Flag_MCQ_ICQ: varchar
PostToERPName: varchar
OrderingCountry: varchar
DeliveryCountry: varchar
InvoiceCountry: varchar
Flag_CaseSynergyWG: int
Flag_Synergy: int
GAMGQ: bit
GAMRequired: bit
ClientName: varchar
ClientGroup: varchar
Priority: nvarchar
Flag_CaseType: nvarchar
Parent_CaseNumber: nvarchar
Flag_compliancequotes: int
```

Convert the user message to a SQL query. Return ONLY SQL. No explanation!
""".strip(),
            },
            {"role": "user", "content": question},
        ],
    }
    response = requests.post(
        "https://llmfoundry.straive.com/v1/chat/completions", headers=headers, json=data
    )
    result = response.json()
    content = result['choices'][0]['message']['content']
    return content.split('```sql')[1].split('```')[0].strip()


def run_query(query):
    server = 'eip_edw.gd.didata.local,1433'
    username = r'svc.Group_csm_Admin@global.ntt'
    password = os.environ.get("PWD")
    cnxn = pyodbc.connect(
        'DRIVER={ODBC Driver 17 for SQL Server};SERVER='
        + server
        + ';Trusted_Connection=yes;Connect Timeout=200;UID='
        + username
        + ';PWD='
        + password
    )
    return pd.read_sql(query, cnxn)


app = FastAPI()


class Question(BaseModel):
    question: str


class SQLQuery(BaseModel):
    sql: str


@app.post("/query")
async def query_endpoint(item: Question):
    return {"sql": get_query(item.question)}


@app.post("/result")
async def result_endpoint(item: SQLQuery):
    return {"result": run_query(item.sql).to_dict(orient="records")}


# Add a static file route to serve index.html
@app.get("/", include_in_schema=False)
async def read_item():
    return FileResponse("index.html")


if __name__ == '__main__':
    question = ' '.join(sys.argv[1:])
    print('Question:', question)
    sql = get_query(question)
    print('SQL:', sql)
    result = run_query(sql)
    print('RESULT:', result)
