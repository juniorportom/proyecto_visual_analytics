from flask import Flask, make_response, render_template
import sqlite3
import io
import csv

app = Flask(__name__)

DATABASE_FILE = 'proyecto_hmc_2.db'


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/categories-data')
def get_categories_data():
    query = ('select ' +
            'Id_Categoria as regionId, ' +
            'Categoria_Medicamento as regionName, ' +
            'Fecha_Prescipcion_amd as date, ' +
            'sum(cast(Valor_Medio as decimal (14,0))) percent, ' +
            'COUNT(Numero_Documento) pacientes ' +
        'from MDCMNTS_PCNTS_LTCST ' +
        'group by Id_Categoria, Fecha_Prescipcion_amd ' +
        'order by Id_Categoria;')

    return execute_query(query)


@app.route('/gender-data')
def get_gender_data():
    query = ('select ' +
            'sexo, ' +
            'cast(Anio_Prescripcion as NUMERIC) Anio_Prescripcion, ' +
            'cast(Mes_Prescripcion as NUMERIC) Mes_Prescripcion, ' +
            'Numero_Documento paciente, ' +
            'cast(Valor_Medio as decimal (14,2)) valor ' +
        'from MDCMNTS_PCNTS_LTCST;')
    return execute_query(query)


def execute_query(query):
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    csvList = list(cursor.execute(query))
    columnTuple = list([tuple[0] for tuple in cursor.description])
    csvList.insert(0, columnTuple)
    si = io.StringIO()
    cw = csv.writer(si)
    cw.writerows(csvList)
    output = make_response(si.getvalue())
    output.headers["Content-Disposition"] = "attachment; filename=export.csv"
    output.headers["Content-type"] = "text/csv"

    return output


if __name__ == '__main__':
    app.run()
