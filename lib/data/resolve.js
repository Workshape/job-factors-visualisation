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

export default function (responses) {
    var entries = [],
        response, entry, i, key, value;

    for (response of responses) {
        entry = {};

        for (i = 0; i < response.length; i++) {
            key = KEYS[i];

            value = response[i];

            entry[key] = value;
        }

        entries.push(entry);
    }

    return entries;
}