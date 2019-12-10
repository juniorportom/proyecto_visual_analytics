from flask import Flask, make_response, render_template, request, json
import sqlite3
import io
import csv

app = Flask(__name__)

DATABASE_FILE = 'proyecto_hmc_2.db'


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/usuario')
def user():
    return render_template('usuario.html')


@app.route('/personal-data')
def personal_data():
    query = (
        "SELECT MDCMNTS_PCNTS_LTCST.Fecha_Prescipcion_amd AS Date, MDCMNTS_PCNTS_LTCST.Medicamento AS Comparison_Type, MDCMNTS_PCNTS_LTCST.Cod_Diagnostico, MDCMNTS_PCNTS_LTCST.Nombre_Diag FROM MDCMNTS_PCNTS_LTCST WHERE MDCMNTS_PCNTS_LTCST.Numero_Documento = '1121926922' ORDER BY Date ASC")
    return execute_query(query)

@app.route('/personal-data-info')
def personal_data_info():
    query = ("SELECT 'Usuaria de Prueba' as User, CAST((julianday() - julianday(Fecha_Nacimiento_amd)) / 365 as INTEGER) AS Edad, sum(cast(Valor_Medio as decimal (14,0))) as Costo, Fuerza, Sexo FROM MDCMNTS_PCNTS_LTCST WHERE MDCMNTS_PCNTS_LTCST.Numero_Documento = '1121926922'")
    return json_execute_query(query)


@app.route('/personal-datatable')
def datatable():
    query = ("SELECT MDCMNTS_PCNTS_LTCST.Fecha_Prescipcion_amd AS Date, MDCMNTS_PCNTS_LTCST.Nombre_Medico, MDCMNTS_PCNTS_LTCST.Tipo_Consulta FROM MDCMNTS_PCNTS_LTCST WHERE MDCMNTS_PCNTS_LTCST.Numero_Documento = 1121926922 GROUP BY MDCMNTS_PCNTS_LTCST.Fecha_Prescipcion_amd ORDER BY Date ASC")
    return json_execute_query(query)


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
             '\'P. Infancia\' ' +
             'when(julianday() - julianday(Fecha_Nacimiento_amd)) / 365 ' +
             'BETWEEN ' +
             '6 and 11 ' +
             'then ' +
             '\'Infancia\' ' +
             'when(julianday() - julianday(Fecha_Nacimiento_amd)) / 365 ' +
             'BETWEEN ' +
             '12 and 18 ' +
             'then ' +
             '\'Adolescencia\' ' +
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
    hierarchyList = request.args.get("hierarchy").split(",")
    hierarchy = ",".join(['"%s"' % x for x in hierarchyList])
    # print('lista: ' + str(hierarchyList))
    # print(hierarchy)

    # query = "select %s, sum(Valor_Medio) count from MDCMNTS_PCNTS_LTCST group by %s;" % (hierarchy, hierarchy)

    query = "select %s, sum(valor_medio) count from ( " \
            "select *, " \
            "case " \
            "when cast((julianday() - julianday(Fecha_Nacimiento_amd)) / 365 as int) <= 5 " \
            "then 'P. Infancia' " \
            "when cast((julianday() - julianday(Fecha_Nacimiento_amd)) / 365 as int) BETWEEN 6 and 11 " \
            "then 'Infancia' " \
            "when cast((julianday() - julianday(Fecha_Nacimiento_amd)) / 365 as int) BETWEEN 12 and 18 " \
            "then 'Adolescencia' " \
            "when cast((julianday() - julianday(Fecha_Nacimiento_amd)) / 365 as int) BETWEEN 19 and 26 " \
            "then 'Juventud' " \
            "when cast((julianday() - julianday(Fecha_Nacimiento_amd)) / 365 as int) BETWEEN 27 and 59 " \
            "then 'Adultez' " \
            "else 'Adulto Mayor' end Grupo_Etario " \
            "from MDCMNTS_PCNTS_LTCST a) v group by %s; " % (hierarchy, hierarchy)

    # print(query)

    return execute_query(query)


@app.route('/laboratory-data.csv')
def laboratory_data():
    query = ("select " +
             "fecha_prescipcion_amd 'fecha_prescipcion_amd',  " +
             "count(codigo_laboratorio)  'cantidad_prescripciones',  " +
             "sum(Valor_Medio) 'Valor_Medio', " +
             "codigo_laboratorio 'codigo_laboratorio'  " +
             "from MDCMNTS_PCNTS_LTCST  " +
             "group by fecha_prescipcion_amd, codigo_laboratorio " +
             "order by Fecha_Prescipcion_amd ;")

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


def json_execute_query(query):
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    data = cursor.execute(query)
    response = app.response_class(
        response=json.dumps(list(data)),
        status=200,
        mimetype='application/json'
    )
    return response

if __name__ == '__main__':
    app.run()
