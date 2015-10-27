var KEYS = [
    'rate_title',
    'rate_stack',
    'rate_team',
    'rate_industry',
    'rate_product',
    'rate_salary',
    'rate_options',
    'rate_location',
    'rate_commute',
    'rate_size',
    'rate_benefits',
    'other',
    'experience',
    'gender',
    'location'
    ];

export default function (data) {
    var entries = [],
        response, entry, id, key, value;

    for (response of data.responses) {
        entry = {};

        for (id in response.answers) {
            if (response.answers.hasOwnProperty(id)) {
                key = KEYS[getQuestionIndex(data.questions, id)];
            }

            value = response.answers[id];

            if (parseInt(value, 10) + '' === value + '') {
                value = parseInt(value, 10);
            }

            entry[key] = value;
        }

        entries.push(entry);
    }

    return entries;
}

function getQuestionIndex(questions, id) {
    for (var i = 0; i < questions.length; i++) {
        if (questions[i].id === id) {
            return i;
        }
    }

    return null;
}