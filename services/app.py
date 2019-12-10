from flask import Flask, make_response, render_template, request
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
            'cast(Valor_Medio as decimal (14,2)) valor, ' +
            'case ' +
            'when (julianday() - julianday(Fecha_Nacimiento_amd)) / 365 <= 5 ' +
            'then ' +
            '\'Primera Incancia\' ' +
            'when(julianday() - julianday(Fecha_Nacimiento_amd)) / 365 ' +
            'BETWEEN ' +
            '6 and 11 ' +
            'then ' +
            '\'Infancia\' ' +
            'when(julianday() - julianday(Fecha_Nacimiento_amd)) / 365 ' +
            'BETWEEN ' +
            '12 and 18 ' +
            'then ' +
            '\'Adolecencia\' ' +
            'when(julianday() - julianday(Fecha_Nacimiento_amd)) / 365 ' +
            'BETWEEN ' +
            '19 and 26 ' +
            'then ' +
            '\'Juventud\' ' +
            'when(julianday() - julianday(Fecha_Nacimiento_amd)) / 365 ' +
            'BETWEEN ' +
            '27 and 59 ' +
            'then ' +
            '\'Adultez\' ' +
            'else ' +
            '\'Adulto Mayor\' ' +
            'end ' +
            'grupo_etario ' +
        'from MDCMNTS_PCNTS_LTCST;')

    return execute_query(query)


@app.route('/hierarchy-data')
def hierarchy_data():
    hierarchyList = request.args.get("hierarchy", "Categoria_Medicamento, Medicamento").split(",")
    hierarchy = ",".join(['"%s"' % x for x in hierarchyList])
    print('lista: ' + str(hierarchyList))
    print(hierarchy)

    query = "select %s, sum(Valor_Medio) count from MDCMNTS_PCNTS_LTCST group by %s;" % (hierarchy, hierarchy)

    print(query)

    return execute_query(query)


@app.route('/laboratory-data.csv')
def laboratory_data():

    query = ("select " +
            "fecha_prescipcion_amd 'date',  " +
            "(sum(Valor_Medio))/1000  'precipitation',  " +
            "(sum(Valor_Medio) + 1000)/1000 'emp_max', " +
            "(sum(Valor_Medio) - 1000)/1000 'temp_min', " +
            "count(Valor_Medio) 'wind', " +
            "codigo_laboratorio 'weather'  " +
        "from MDCMNTS_PCNTS_LTCST  " +
        "where fecha_prescipcion_amd BETWEEN '2018/01/01' and '2018/12/31' " +
        "group by fecha_prescipcion_amd, codigo_laboratorio " +
        "order by Fecha_Prescipcion_amd limit 500;")

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
