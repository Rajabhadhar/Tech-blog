import 'dotenv/config';
import connectDB from '../config/db.js';
import Category from '../models/Category.js';
import Post from '../models/Post.js';

const seedData = async () => {
  try {
    await connectDB();

    // 1. Wipe current collections
    await Post.deleteMany();
    await Category.deleteMany();
    console.log('Cleared existing Posts and Categories...');

    // 2. Insert Categories using Category.create to trigger pre('save') slug hook
    const categoriesData = [
      {
        name: 'Cloud Architecture',
        description: 'Scalable distributed systems, serverless paradigms, and cloud-native design.',
      },
      {
        name: 'DevOps & CI/CD',
        description: 'Automation pipelines, containerization, observability, and infrastructure as code.',
      },
      {
        name: 'Full Stack Engineering',
        description: 'Modern web technologies, state management, API design, and performance tuning.',
      },
      {
        name: 'Database Engineering',
        description: 'Relational vs NoSQL optimizations, indexing strategies, and high-concurrency storage.',
      },
    ];

    const categories = [];
    for (const cat of categoriesData) {
      const createdCategory = await Category.create(cat);
      categories.push(createdCategory);
    }

    console.log(`Seeded ${categories.length} Categories.`);

    // 3. Create Posts referencing inserted categories
    const samplePosts = [
      {
        title: 'Architecting High-Throughput APIs with Node.js and MongoDB',
        summary: 'Explore architectural patterns for designing resilient, low-latency RESTful APIs using Node.js clustering, Mongoose connection pooling, and indexing.',
        content: `
          <h2>Understanding Bottlenecks in Modern APIs</h2>
          <p>When scaling I/O heavy Node.js applications, connection management to MongoDB clusters often becomes the primary bottleneck if not properly optimized.</p>
          <h2>Implementing Efficient Compound Indexes</h2>
          <p>Compound indexes allow MongoDB to satisfy multiple query attributes in a single B-tree traversal. By indexing both status flags and creation timestamps, sorting operations execute in memory without secondary scans.</p>
          <pre><code>db.posts.createIndex({ status: 1, createdAt: -1 });</code></pre>
          <h2>Conclusion</h2>
          <p>Pairing thoughtful data models with non-blocking Node event loops yields predictable latency curves even under spike traffic.</p>
        `,
        coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
        category: categories[2]._id,
        tags: ['Node.js', 'MongoDB', 'Architecture', 'Performance'],
        featured: true,
        status: 'published',
      },
      {
        title: 'Zero-Downtime Deployments Using Docker and Reverse Proxies',
        summary: 'A step-by-step architectural breakdown of blue-green deployments, health checking, and zero-downtime rollouts with Nginx and container runtimes.',
        content: `
          <h2>The Goal of Continuous Delivery</h2>
          <p>Production environments demand uninterrupted user experience while shipping frequent iterations.</p>
          <h2>Blue-Green Switching Mechanism</h2>
          <p>By operating two identical application environments and orchestrating traffic switches via upstream proxy definitions, developers can test release candidates in staging parity before traffic rerouting.</p>
        `,
        coverImage: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=1200&q=80',
        category: categories[1]._id,
        tags: ['Docker', 'DevOps', 'CI/CD'],
        featured: true,
        status: 'published',
      },
      {
        title: 'Optimizing Query Execution Plans in Distributed NoSQL Databases',
        summary: 'Deep dive into MongoDB explain plans, execution stats, index bounding, and reducing working set memory footprints.',
        content: `
          <h2>Deciphering the Explain Output</h2>
          <p>Analyzing winning plans versus rejected plans exposes full collection scans (COLLSCAN) that drain cluster memory cache.</p>
          <h2>Index Coverage</h2>
          <p>A covered query is one where all requested projection fields are satisfied directly by an index without fetching the actual document from disk.</p>
        `,
        coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=80',
        category: categories[3]._id,
        tags: ['Database', 'NoSQL', 'Performance'],
        featured: false,
        status: 'published',
      },
      {
        title: 'Event-Driven Microservices with Message Queues',
        summary: 'How decoupled asynchronous worker queues transform monolithic backends into fault-tolerant distributed platforms.',
        content: `
          <h2>Synchronous vs Asynchronous Communication</h2>
          <p>Direct HTTP calls between microservices compound latency and create single points of failure across the network call graph.</p>
          <h2>Decoupling via Pub/Sub</h2>
          <p>Message brokers absorb traffic spikes, allowing consumers to process workloads at their own throughput pace.</p>
        `,
        coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
        category: categories[0]._id,
        tags: ['Microservices', 'Distributed Systems', 'Cloud'],
        featured: false,
        status: 'published',
      },
    ];

    for (const postData of samplePosts) {
      await Post.create(postData);
    }

    console.log(`Successfully seeded ${samplePosts.length} Posts with auto-generated slugs and reading times.`);
    process.exit(0);
  } catch (error) {
    console.error(`Seeder failed: ${error.message}`);
    process.exit(1);
  }
};

seedData();