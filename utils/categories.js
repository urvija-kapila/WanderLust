
const categories = [
    { name: "Trending", icon: "fa-solid fa-fire" },
    { name: "Rooms", icon: "fa-solid fa-bed" },
    { name: "Iconic Cities", icon: "fa-solid fa-city" },
    { name: "Mountains", icon: "fa-solid fa-mountain" },
    { name: "Castles", icon: "fa-brands fa-fort-awesome" },
    { name: "Beaches", icon: "fa-solid fa-umbrella-beach" },
    { name: "Amazing Pools", icon: "fa-solid fa-person-swimming" },
    { name: "Camping", icon: "fa-solid fa-campground" },
    { name: "Arctic", icon: "fa-regular fa-snowflake" },
    { name: "Farms", icon: "fa-solid fa-cow" },
    { name: "Dome", icon: "fa-solid fa-landmark-dome" }
];

const categoryNames = categories.map(category => category.name);

module.exports = { categories, categoryNames };
