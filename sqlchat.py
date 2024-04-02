import os
import requests
import pandas as pd
import pyodbc


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


if __name__ == '__main__':
    result = run_query('SELECT COUNT(*) FROM Infosys.GBS_O2O_QUOTEVOLUMETRIC')
    print(result)
