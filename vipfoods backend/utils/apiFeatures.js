class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  search() {
    if (this.queryString.search) {
      this.query = this.query.find({
        name: {
          $regex: this.queryString.search,
          $options: "i",
        },
      });
    }

    return this;
  }

  filter() {
    const filter = {};

    if (this.queryString.category) {
      filter.category = this.queryString.category;
    }

    if (this.queryString.featured) {
      filter.featured =
        this.queryString.featured === "true";
    }

    if (this.queryString.active) {
      filter.active =
        this.queryString.active === "true";
    }

    if (this.queryString.badge) {
      filter.badges = this.queryString.badge;
    }

    this.query = this.query.find(filter);

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      this.query = this.query.sort(this.queryString.sort);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  paginate(resultPerPage = 12) {
    const currentPage =
      Number(this.queryString.page) || 1;

    const skip =
      resultPerPage * (currentPage - 1);

    this.query = this.query.limit(resultPerPage).skip(skip);

    return this;
  }
}

export default APIFeatures;