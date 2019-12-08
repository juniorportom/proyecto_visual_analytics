let timeFormatEs = d3.timeFormatLocale({
    dateTime: "%a %b %e %X %Y",
    date: "%m/%d/%Y",
    time: "%H:%M:%S",
    periods: ["AM", "PM"],
    days: [ "Domingo",
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado"
    ],
    shortDays: ["Dom", "Lun", "Mar", "Mi", "Jue", "Vie", "Sab"],
    months: [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre"
    ],
    shortMonths: [
        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic"
    ]
});

let locale = {
  "decimal": ",",
  "thousands": ".",
  "grouping": [3],
  "currency": ["$", ""]
};

d3.formatDefaultLocale(locale);
var formatValue = d3.format("$,.0f");


var formatMillisecond = timeFormatEs.format(".%L"),
    formatSecond = timeFormatEs.format(":%S"),
    formatMinute = timeFormatEs.format("%I:%M"),
    formatHour = timeFormatEs.format("%I %p"),
    formatDay = timeFormatEs.format("%a %d"),
    formatWeek = timeFormatEs.format("%b %d"),
    formatMonth = timeFormatEs.format("%B"),
    formatYear = timeFormatEs.format("%Y");

function multiFormat(date) {
    return (d3.timeSecond(date) < date ? formatMillisecond
        : d3.timeMinute(date) < date ? formatSecond
            : d3.timeHour(date) < date ? formatMinute
                : d3.timeDay(date) < date ? formatHour
                    : d3.timeMonth(date) < date ? (d3.timeWeek(date) < date ? formatDay : formatWeek)
                        : d3.timeYear(date) < date ? formatMonth
                            : formatYear)(date);
}
