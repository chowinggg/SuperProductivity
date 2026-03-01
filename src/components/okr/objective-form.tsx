/**
 * ============================================
 * Objective Form 组件
 * ============================================
 * 
 * 创建/编辑 OKR 目标的表单
 */

"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormItem } from "@/components/ui/form";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Objective, CreateObjectiveInput } from "@/types/supabase";

// 表单验证 Schema
const formSchema = z.object({
  title: z.string().min(1, "请输入目标标题").max(200, "标题最多200个字符"),
  description: z.string().max(1000, "描述最多1000个字符").optional(),
  quarter: z.string().regex(/^\d{4}-Q[1-4]$/, "格式如：2024-Q1"),
});

type FormData = z.infer<typeof formSchema>;

interface ObjectiveFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  objective?: Objective | null;
  onSubmit: (data: CreateObjectiveInput) => void;
  isSubmitting?: boolean;
}

// 获取当前季度
function getCurrentQuarter(): string {
  const now = new Date();
  const year = now.getFullYear();
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  return `${year}-Q${quarter}`;
}

// 获取可选的季度列表
function getQuarterOptions(): string[] {
  const year = new Date().getFullYear();
  return [
    `${year - 1}-Q4`,
    `${year}-Q1`,
    `${year}-Q2`,
    `${year}-Q3`,
    `${year}-Q4`,
    `${year + 1}-Q1`,
  ];
}

export function ObjectiveForm({
  open,
  onOpenChange,
  objective,
  onSubmit,
  isSubmitting,
}: ObjectiveFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: objective?.title || "",
      description: objective?.description || "",
      quarter: objective?.quarter || getCurrentQuarter(),
    },
  });

  // 重置表单当 objective 变化时
  React.useEffect(() => {
    if (open) {
      reset({
        title: objective?.title || "",
        description: objective?.description || "",
        quarter: objective?.quarter || getCurrentQuarter(),
      });
    }
  }, [open, objective, reset]);

  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      ...data,
      description: data.description || null,
    } as CreateObjectiveInput);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {objective ? "编辑目标" : "新建目标"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <FormItem
            label="目标标题"
            htmlFor="title"
            error={errors.title?.message}
            required
          >
            <Input
              id="title"
              placeholder="例如：提升团队技术能力"
              {...register("title")}
            />
          </FormItem>

          <FormItem
            label="描述"
            htmlFor="description"
            error={errors.description?.message}
          >
            <Textarea
              id="description"
              placeholder="描述这个目标的具体内容和期望成果..."
              rows={3}
              {...register("description")}
            />
          </FormItem>

          <FormItem
            label="季度"
            htmlFor="quarter"
            error={errors.quarter?.message}
            required
          >
            <Select id="quarter" {...register("quarter")}>
              {getQuarterOptions().map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </Select>
          </FormItem>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {objective ? "保存" : "创建"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
