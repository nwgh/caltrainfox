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

    find_trains: function find_trains(train_list) {
        var trains = [];
        for (var t of train_list) {
            if (t["stops"][this.station_from] !== -1 &&
                t["stops"][this.station_to] !== -1) {
                trains.push(t);
            }
        }

        return trains;
    },

    calculate_fare: function calculate_fare() {
        var base = 3;
        var zone_from = this.stations[this.station_from].zone;
        var zone_to = this.stations[this.station_to].zone;
        var num_zones = Math.abs(zone_to - zone_from);
        var fare = base + (2 * num_zones);
        return "" + fare + ".00";
    },

    populate_timetable: function populate_timetable(trains) {
        // TODO - style this better
        if (trains.length === 0) {
            $("#schedule").innerHTML = "No Trains Found";
            return;
        }

        for (var t of trains) {
            var info = "#" + t["train"] + " l:" + t["stops"][this.station_from] +
                " a:" + t["stops"][this.station_to] + "<br>";
            $("#schedule").append(info);
        }
    },

    do_update: function do_update() {
        var train_list = null;
        if (this.is_weekend) {
            if (this.station_to < this.station_from) {
                train_list = this.we_nb;
            } else {
                train_list = this.we_sb;
            }
        } else {
            if (this.station_to < this.station_from) {
                train_list = this.wd_nb;
            } else {
                train_list = this.wd_sb;
            }
        }

        var trains = this.find_trains(train_list);
        var fare = this.calculate_fare();
        $("#fare").innerHTML = fare;
        this.populate_timetable(trains);
    },

    // The callback for when the user changes one of their station selections
    update_stations: function update_stations() {
        this.station_from = parseInt($("#station_from").value);
        this.station_to = parseInt($("#station_to").value);
        this.do_update();
    },

    // The callback for when the user changes between weekend & weekday
    change_schedule_type: function change_schedule_type() {
        this.is_weekend = !this.is_weekend;
        var sel = $("#schedule_type_selector");
        var cur = $("#schedule_type");
        if (this.is_weekend) {
            sel.innerHTML = "Weekday";
            cur.innerHTML = "Weekend";
        } else {
            sel.innerHTML = "Weekend";
            cur.innerHTML = "Weekday";
        }

        this.do_update();
    },

    // The callback for when the user changes train direction
    reverse_direction: function reverse_direction() {
        this.station_from, this.station_to = this.station_to, this.station_from;
        this.do_update();
    },

    populate_selectors: function populate_selectors() {
        var selectors = ["#station_from", "#station_to"];
        for (var s of selectors) {
            var selector = $(s);
            for (var station of stations) {
                var option = $("<option></option>");
                option.value = s["id"];
                option.innerHTML = s["name"];
                s.append(option);
            }
        }

        $("#station_from").selectedIndex = this.station_from;
        $("#station_to").selectedIndex = this.station_to;
    },

    setup: function setup() {
        var station_from = localStorage.getItem("station_from");
        var station_to = localStorage.getItem("station_to");
        var is_weekend = localStorage.getItem("is_weekend");

        // Default to from SF and to SJ
        if (!station_from) {
            this.station_from = 0; // San Francisco 4th & King
        } else {
            this.station_from = parseInt(station_from, 10);
        }

        if (!station_to) {
            // XXX: This will need changed if Caltrain ever builds another
            // station between SF and SJ
            this.station_to = 24; // San Jose Diridon
        } else {
            this.station_to = parseInt(station_to, 10);
        }

        this.populate_selectors();

        if (is_weekend === "true") {
            this.is_weekend = true;
        }

        this.do_update();

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
