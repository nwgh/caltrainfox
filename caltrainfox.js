var CaltrainFox = {
    is_weekend: false,
    station_from: null,
    station_to: null,

    // These are filled in by stops.js and stations.js, which are auto-generated
    // from the data provided by Caltrain.
    wd_nb: null,
    wd_sb: null,
    we_nb: null,
    we_sb: null,
    stations: null,

    find_trains: function find_trains() {
        // TODO
    },

    calculate_fare: function calculate_fare() {
        // TODO
    },

    populate_timetable: function populate_timetable(trips) {
        // TODO
    },

    populate_selector: function populate_selector(selid) {
        // TODO
    },

    // The callback for when the user changes one of their station selections
    update_stations: function update_stations() {
        // TODO
    },

    // The callback for when the user changes between weekend & weekday
    change_schedule_type: function change_schedule_type() {
        // TODO
    },

    reverse_direction: function reverse_direction() {
        // TODO
    },

    setup: function setup() {
        var events = ["click", "touch"];
        for (var e of events) {
            $("#reverse_menu").on(e, function() { CaltrainFox.revese_direction(); });
            $("#schedule_type_menu").on(e, function() { CaltrainFox.change_schedule_type(); });
        }

        var selectors = ["#station_from", "#station_to"];
        for (var s of selectors) {
            $(s).on("change", function() { CaltrainFox.update_stations(); });
        }
    }
};

$(function () {
    CaltrainFox.setup();
});
