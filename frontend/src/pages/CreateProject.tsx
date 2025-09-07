import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const categories = [
  "Gaming", "Technology", "Art", "Music", "Film",
  "Publishing", "Fashion", "Food", "Sports",
  "Education", "Health", "Environment", "Other"
];

// Type for schema
interface ProjectFormData {
  title: string;
  description: string;
  fullDescription?: string;
  image: string;
  goal: number;
  daysLeft: number;
  category: string;
  creator: string;
  walletAddress?: string;
  contractAddress?: string;
  updates: { date: string; title: string; content: string }[];
  rewards: { amount: number; title: string; description: string }[];
}

const API_BASE_URL = "http://127.0.0.1:5000/api/projects";

export const ProjectForm: React.FC = () => {
  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    description: "",
    fullDescription: "",
    image: "",
    goal: 0.1,
    daysLeft: 1,
    category: "Gaming",
    creator: "",
    walletAddress: "",
    contractAddress: "",
    updates: [],
    rewards: []
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddUpdate = () => {
    setFormData((prev) => ({
      ...prev,
      updates: [...prev.updates, { date: "", title: "", content: "" }]
    }));
  };

  const handleUpdateChange = (index: number, field: string, value: string) => {
    const updates = [...formData.updates];
    updates[index] = { ...updates[index], [field]: value };
    setFormData((prev) => ({ ...prev, updates }));
  };

  const handleAddReward = () => {
    setFormData((prev) => ({
      ...prev,
      rewards: [...prev.rewards, { amount: 0, title: "", description: "" }]
    }));
  };

  const handleRewardChange = (index: number, field: string, value: string) => {
    const rewards = [...formData.rewards];
    rewards[index] = { ...rewards[index], [field]: field === "amount" ? Number(value) : value };
    setFormData((prev) => ({ ...prev, rewards }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        throw new Error("HTTP error! status: ${res.status}");
      }

      const data = await res.json();
      console.log("Project created:", data);
      alert("Project created successfully!");
    } catch (err) {
      console.error("Error submitting project:", err);
      alert("Failed to create project.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <Label>Title</Label>
        <Input name="title" value={formData.title} onChange={handleChange} required maxLength={100} />
      </div>

      {/* Description */}
      <div>
        <Label>Description</Label>
        <Textarea name="description" value={formData.description} onChange={handleChange} required maxLength={1000} />
      </div>

      {/* Full Description */}
      <div>
        <Label>Full Description</Label>
        <Textarea name="fullDescription" value={formData.fullDescription} onChange={handleChange} maxLength={5000} />
      </div>

      {/* Image */}
      <div>
        <Label>Project Image (URL)</Label>
        <Input type="url" name="image" value={formData.image} onChange={handleChange} required />
      </div>

      {/* Goal */}
      <div>
        <Label>Funding Goal (ETH)</Label>
        <Input type="number" name="goal" value={formData.goal} onChange={handleChange} min="0.1" step="0.01" required />
      </div>

      {/* Days Left */}
      <div>
        <Label>Campaign Duration (Days)</Label>
        <Input type="number" name="daysLeft" value={formData.daysLeft} onChange={handleChange} min="1" required />
      </div>

      {/* Category */}
      <div>
        <Label>Category</Label>
        <select name="category" value={formData.category} onChange={handleChange} required className="border rounded px-3 py-2 w-full">
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Creator */}
      <div>
        <Label>Creator Name</Label>
        <Input name="creator" value={formData.creator} onChange={handleChange} required maxLength={50} />
      </div>

      {/* Wallet Address */}
      <div>
        <Label>Wallet Address (Ethereum)</Label>
        <Input
          name="walletAddress"
          value={formData.walletAddress}
          onChange={handleChange}
          pattern="^0x[a-fA-F0-9]{40}$"
          placeholder="0x..."
        />
      </div>

      {/* Contract Address */}
      <div>
        <Label>Contract Address</Label>
        <Input
          name="contractAddress"
          value={formData.contractAddress}
          onChange={handleChange}
          pattern="^0x[a-fA-F0-9]{40}$"
          placeholder="0x..."
        />
      </div>

      {/* Updates */}
      <Card>
        <CardContent className="space-y-4">
          <h3 className="font-semibold">Project Updates</h3>
          {formData.updates.map((u, i) => (
            <div key={i} className="grid gap-2 border p-3 rounded">
              <Input type="date" value={u.date} onChange={(e) => handleUpdateChange(i, "date", e.target.value)} required />
              <Input placeholder="Update Title" value={u.title} onChange={(e) => handleUpdateChange(i, "title", e.target.value)} required />
              <Textarea placeholder="Update Content" value={u.content} onChange={(e) => handleUpdateChange(i, "content", e.target.value)} required />
            </div>
          ))}
          <Button type="button" variant="outline" onClick={handleAddUpdate}>
            Add Update
          </Button>
        </CardContent>
      </Card>

      {/* Rewards */}
      <Card>
        <CardContent className="space-y-4">
          <h3 className="font-semibold">Rewards</h3>
          {formData.rewards.map((r, i) => (
            <div key={i} className="grid gap-2 border p-3 rounded">
              <Input
                type="number"
                placeholder="Amount (ETH)"
                value={r.amount}
                onChange={(e) => handleRewardChange(i, "amount", e.target.value)}
                required
              />
              <Input
                placeholder="Reward Title"
                value={r.title}
                onChange={(e) => handleRewardChange(i, "title", e.target.value)}
                required
              />
              <Textarea
                placeholder="Reward Description"
                value={r.description}
                onChange={(e) => handleRewardChange(i, "description", e.target.value)}
                required
              />
            </div>
          ))}
          <Button type="button" variant="outline" onClick={handleAddReward}>
            Add Reward
          </Button>
        </CardContent>
      </Card>

      {/* Submit */}
      <Button type="submit" className="w-full bg-gradient-primary">
        Submit Project
      </Button>
    </form>
  );
};

export default ProjectForm;