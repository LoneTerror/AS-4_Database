# 🛠️ Setup & Installation


## **1. Clone the repository**

```
git clone https://github.com/LoneTerror/AS-4_Database.git
cd reward-system
```

## **2. Install Dependencies**

```
npm install
```

## **3. Configure Environment Create a .env file in the root directory:**

```
DATABASE_URL="postgresql://user:pass@ep-cool-pooler.region.neon.tech/neondb?sslmode=require"
```

* In test case scenario you can use [Neon DB](https://neon.com)
- Create a project, then copy the database connection url, refer to docs[Neon Docs](https://neon.com/docs/introduction/branching).
- Paste that database connection url.
* The above url is just an example, do not use it in main project!

## **4. Generate Prisma Client This project uses a custom output path (./generated/prisma)**

```
npx prisma generate
```


# **🗄️ Database Setup**

## **1. Push Schema**

* Sync the Prisma schema with your Neon database.
* The Schema file is located at `/prisma/schema.prisma` modifications must be done before pushing!

```
npx prisma db push
```

## **2. Seed Data (Important)**

* This project handles Circular Dependencies (Employee <-> Status <-> Designation). 
* The seed script uses a raw SQL transaction strategy to bypass foreign key constraints during initialization.
* The seed file is located at `/prisma/seed.ts` modifications must be done before pushing!

```
npx prisma db seed
```



## ✅ Verification
## To verify the system integrity and circular links:

```
npx tsx verify.ts
```



## 📝 Key Features
* **Strict Audit Logging:** All tables track `createdBy` and `updatedBy`.
* **Circular bootstrapping:** Custom seeding logic to handle strict foreign key constraints.
* **Serverless Ready:** Uses `@prisma/adapter-pg` for efficient connection pooling on Neon.


## Git Initialization Commands
* Now, open your terminal in the project folder and run these commands one by one to push everything to GitHub.

**Step 1: Initialize Git**

```
git init
```

# ***OR***
*(Cloning is recommend if you want to contribute and suggest changes to this repository)*

**Clone this repository**

```
git clone https://github.com/LoneTerror/AS-4_Database.git
```

**Step 2: Link to GitHub Repository (if you have ran the `git init` command)**

```
git remote add origin https://github.com/LoneTerror/AS-4_Database.git
```

**Step 3: Pull Recent Changes Before Pushing**

```
git pull
```

**Step 4: Create New Branch before push**

```
git branch -M <git_username>-patch-<patch_number>
```
*(Example: git branch -M loneTerror-patch-0)*

**Step 5: Add Files**

```
git add .
```

**Step 6: Commit**

```
git commit -m "Initial commit: Employee Rewards System with Prisma and RDS Database"
```

**Step 7: Push (on the new branch you created earlier)**

```
git git push -u origin <branchname>
```
*(Example: git push -u origin loneTerror-patch-0)*

**Step 8: Pull Request**

* Go To  [Pull Requests](https://github.com/LoneTerror/AS-4_Database/pulls)
* The CodeOwners will review your pull request, then they will approve/reject
* If your pull request is approved, then your created branch will be merged and deleted